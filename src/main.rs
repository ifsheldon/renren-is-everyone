use chardetng::EncodingDetector;
use clap::Parser;
use encoding_rs::Encoding;
use glob::glob;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs::{self, File};
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(name = "subtitle-processor")]
#[command(about = "Detect or transcode subtitle file encodings", long_about = None)]
struct Cli {
    #[command(flatten)]
    mode: Mode,

    /// Root directory to process
    #[arg(long, short, default_value = "subtitle-backup")]
    path: String,
}

#[derive(clap::Args)]
#[group(required = true, multiple = false)]
struct Mode {
    /// Detect encodings of all subtitle files
    #[arg(long)]
    detect: bool,

    /// Transcode subtitle files to UTF-8 using encodings.json
    #[arg(long)]
    transcode: bool,
}

#[derive(Serialize, Deserialize)]
struct EncodingEntry {
    path: String,
    encoding: String,
}

#[derive(Serialize, Deserialize)]
struct EncodingResult {
    encodings: Vec<EncodingEntry>,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let root = Path::new(&cli.path);

    if !root.exists() {
        eprintln!("Root directory {} does not exist.", root.display());
        return Ok(());
    }

    if cli.mode.detect {
        run_detection(root)?;
    } else if cli.mode.transcode {
        run_transcoding(root)?;
    }

    Ok(())
}

fn run_detection(root: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let subtitle_files = collect_subtitle_files(root);
    println!("Scanning {} subtitle files...", subtitle_files.len());

    let outcomes: Vec<DetectionOutcome> = subtitle_files
        .par_iter()
        .map(|path| detect_encoding(path))
        .collect();

    let mut encodings = Vec::new();
    let mut io_errors = Vec::new();

    for outcome in outcomes {
        match outcome {
            DetectionOutcome::Detected(entry) => encodings.push(entry),
            DetectionOutcome::IoError { path, error } => io_errors.push((path, error)),
        }
    }

    println!("Detected encodings for {} files.", encodings.len());
    if !io_errors.is_empty() {
        eprintln!(
            "Encountered {} IO errors while reading subtitle files.",
            io_errors.len()
        );
        for (path, error) in io_errors.iter().take(10) {
            eprintln!("  {} -> {}", path.display(), error);
        }
        if io_errors.len() > 10 {
            eprintln!("  ... ({} more)", io_errors.len() - 10);
        }
    }

    let output = EncodingResult { encodings };

    let output_path = root.join("encodings.json");
    let file = File::create(&output_path)?;
    serde_json::to_writer_pretty(file, &output)?;
    println!("Wrote encoding results to {}", output_path.display());

    Ok(())
}

fn run_transcoding(root: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let encodings_path = root.join("encodings.json");
    
    if !encodings_path.exists() {
        eprintln!("encodings.json not found at {}", encodings_path.display());
        eprintln!("Please run with --detect first to generate the encodings file.");
        return Ok(());
    }

    println!("Loading encodings from {}...", encodings_path.display());
    let file = File::open(&encodings_path)?;
    let encoding_result: EncodingResult = serde_json::from_reader(file)?;

    println!("Processing {} files...", encoding_result.encodings.len());

    let results: Vec<TranscodeResult> = encoding_result
        .encodings
        .par_iter()
        .map(|entry| transcode_file(entry))
        .collect();

    let mut skipped = 0;
    let mut transcoded = 0;
    let mut errors = Vec::new();

    for result in results {
        match result {
            TranscodeResult::Skipped => skipped += 1,
            TranscodeResult::Transcoded => transcoded += 1,
            TranscodeResult::Error { path, error } => errors.push((path, error)),
        }
    }

    println!("\nTranscoding complete!");
    println!("  Transcoded: {}", transcoded);
    println!("  Skipped (already UTF-8): {}", skipped);
    println!("  Errors: {}", errors.len());

    if !errors.is_empty() {
        eprintln!("\nEncountered {} errors:", errors.len());
        for (path, error) in errors.iter().take(10) {
            eprintln!("  {} -> {}", path, error);
        }
        if errors.len() > 10 {
            eprintln!("  ... ({} more)", errors.len() - 10);
        }
    }

    Ok(())
}

fn collect_subtitle_files(root: &Path) -> Vec<PathBuf> {
    let base = root.to_string_lossy();
    let base = base.trim_end_matches(std::path::MAIN_SEPARATOR);
    let useful_file_extensions = ["srt", "ass", "ssa", "sub", "sup"]
        .into_iter()
        .collect::<HashSet<_>>();

    let pattern = format!("{base}/**/*");
    glob(&pattern)
        .unwrap()
        .filter(|p| p.is_ok())
        .map(|p| p.unwrap())
        .filter(|p| p.is_file())
        .filter(|p| {
            p.extension().is_some_and(|suffix| {
                useful_file_extensions.contains(&suffix.to_string_lossy().to_lowercase().as_ref())
            })
        })
        .collect()
}

fn detect_encoding(path: &Path) -> DetectionOutcome {
    let bytes = match fs::read(path) {
        Ok(bytes) => bytes,
        Err(err) => {
            return DetectionOutcome::IoError {
                path: path.to_path_buf(),
                error: err.to_string(),
            };
        }
    };

    let mut detector = EncodingDetector::new();
    detector.feed(&bytes, true);
    let encoding = detector.guess(None, true);

    DetectionOutcome::Detected(EncodingEntry {
        path: path.to_string_lossy().into_owned(),
        encoding: encoding.name().to_string(),
    })
}

enum DetectionOutcome {
    Detected(EncodingEntry),
    IoError { path: PathBuf, error: String },
}

enum TranscodeResult {
    Skipped,
    Transcoded,
    Error { path: String, error: String },
}

fn transcode_file(entry: &EncodingEntry) -> TranscodeResult {
    // Skip UTF-8 files
    if entry.encoding.eq_ignore_ascii_case("UTF-8") {
        return TranscodeResult::Skipped;
    }

    let path = Path::new(&entry.path);
    
    // Read the file as bytes
    let bytes = match fs::read(path) {
        Ok(bytes) => bytes,
        Err(err) => {
            return TranscodeResult::Error {
                path: entry.path.clone(),
                error: format!("Failed to read file: {}", err),
            };
        }
    };

    // Get the encoding
    let encoding = match Encoding::for_label(entry.encoding.as_bytes()) {
        Some(enc) => enc,
        None => {
            return TranscodeResult::Error {
                path: entry.path.clone(),
                error: format!("Unknown encoding: {}", entry.encoding),
            };
        }
    };

    // Decode from the detected encoding
    let (decoded, _encoding_used, had_errors) = encoding.decode(&bytes);
    
    if had_errors {
        eprintln!(
            "Warning: {} had decoding errors with encoding {}",
            entry.path, entry.encoding
        );
    }

    // Write back as UTF-8
    match fs::write(path, decoded.as_bytes()) {
        Ok(_) => TranscodeResult::Transcoded,
        Err(err) => TranscodeResult::Error {
            path: entry.path.clone(),
            error: format!("Failed to write file: {}", err),
        },
    }
}
