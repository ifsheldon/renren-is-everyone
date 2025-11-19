# Subtitle Cleanup Tools

This repository contains a collection of Python and Rust scripts designed to clean up, organize, and fix encoding issues in a subtitle backup directory.

## Getting Started

**CRITICAL:** These scripts are designed to work with a folder named `subtitle-backup` in the current directory.

1.  **Unzip your subtitle archive** so that you have a `subtitle-backup` folder in the project root:
    ```
    ./subtitle-backup/
    ```
2.  Run the scripts from the project root.

## Prerequisites

- **Python 3.12+**
- **Rust** (latest stable)
- **System Tools**:
  - `unrar` (required for extracting `.rar` files with `unzip_all.py`). On macOS: `brew install unrar`.

## Installation

### Python Dependencies
This project uses `uv` or standard `pip` with `pyproject.toml`.

```bash
# Using uv (recommended)
uv sync

# Or using pip
pip install .
```

### Build Rust Tool
Build the subtitle processor binary:

```bash
cargo build --release
```

## Usage

All scripts operate on the `./subtitle-backup/` directory by default.

### Python Scripts

1.  **`unzip_all.py`**
    Recursively finds and extracts `.zip`, `.rar`, and `.7z` archives inside `subtitle-backup`.
    -   *Action*: Extracts to the same folder and **deletes** the source archive.
    -   *Run*: `python unzip_all.py`

2.  **`clean_useless_files.py`**
    Removes non-subtitle files.
    -   *Keeps*: `.ass`, `.srt`, `.ssa`, `.sub`, `.sup`.
    -   *Deletes*: Everything else.
    -   *Run*: `python clean_useless_files.py`

3.  **`delete_bad_subtitles.py`**
    Heuristic cleaning of bad subtitle files.
    -   *Deletes*: Files with < 100 lines.
    -   *Deletes*: Spam files where > 12.5% of lines contain "字幕".
    -   *Run*: `python delete_bad_subtitles.py`

4.  **`fix_garbled_filenames.py`**
    Fixes filenames with encoding issues (Mojibake: GBK interpreted as CP437).
    -   *Run*: `python fix_garbled_filenames.py`
    -   *Options*:
        -   `--dry-run`: Preview changes without renaming.
        -   `--output`: Specify report JSON file (default: `filename_fix_report.json`).

5.  **`delete_empty.py`**
    Cleanup utility.
    -   *Deletes*: `.DS_Store` files.
    -   *Deletes*: Files <= 10 bytes.
    -   *Deletes*: Empty directories.
    -   *Run*: `python delete_empty.py`

### Rust Tool (`subtitle-processor`)

High-performance encoding detection and transcoding tool.

**1. Detect Encodings**
Scans all subtitles in `./subtitle-backup` and guesses their character encoding. Results are saved to `encodings.json`.

```bash
cargo run --release -- --detect
```

**2. Transcode to UTF-8**
Reads `encodings.json` and converts files to UTF-8 (skips files already in UTF-8).

```bash
cargo run --release -- --transcode
```
