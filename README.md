# Subtitle Cleanup Tools

This repository contains a collection of Python and Rust scripts designed to clean up, organize, and fix encoding issues in a subtitle backup from Renren Yingshi.

## Cleaning done

- clean useless files other than subtitle files
- clean empty directories and files that are <= 10 bytes
- clean bad subtitles, see [the script](delete_bad_subtitles.py) for details
- fix garbled filenames, see [the script](fix_garbled_filenames.py) for details
- transcode subtitles to UTF-8, see [the script](transcode_subtitles.py) for details
- detect encodings of all subtitle files, see [the script](detect_text_encoding.ipynb) for details
- remove all .DS_Store files

## Download Subtitles

* Original subtitles can be downloaded with Resilio Sync with the key `BNMCIUVQAKGNAQITZOJSERISPZHZWA2X7`
* Cleaned subtitles can be downloaded with Resilio Sync with the key `BFPXVGTDY2PK5PPYKP4HCN6CYG5JYFQGE`

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

    - _Action_: Extracts to the same folder and **deletes** the source archive.
    - _Run_: `python unzip_all.py`

2.  **`clean_useless_files.py`**
    Removes non-subtitle files.

    - _Keeps_: `.ass`, `.srt`, `.ssa`, `.sub`, `.sup`.
    - _Deletes_: Everything else.
    - _Run_: `python clean_useless_files.py`

3.  **`delete_bad_subtitles.py`**
    Heuristic cleaning of bad subtitle files.

    - _Deletes_: Files with < 100 lines.
    - _Deletes_: Spam files where > 12.5% of lines contain "字幕".
    - _Run_: `python delete_bad_subtitles.py`

4.  **`fix_garbled_filenames.py`**
    Fixes filenames with encoding issues (Mojibake: GBK interpreted as CP437).

    - _Run_: `python fix_garbled_filenames.py`
    - _Options_:
      - `--dry-run`: Preview changes without renaming.
      - `--output`: Specify report JSON file (default: `filename_fix_report.json`).

5.  **`delete_empty.py`**
    Cleanup utility.
    - _Deletes_: `.DS_Store` files.
    - _Deletes_: Files <= 10 bytes.
    - _Deletes_: Empty directories.
    - _Run_: `python delete_empty.py`

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
