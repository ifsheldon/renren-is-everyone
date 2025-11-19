import os
import json
import argparse

def is_non_ascii(string):
    """
    Checks if a string contains any non-ASCII characters.
    """
    return any(ord(char) > 127 for char in string)

def fix_garbled_filename(filename):
    """
    Attempts to fix a garbled filename by reversing the common MOJIBAKE pattern:
    GBK bytes interpreted as CP437.
    
    Returns:
        The fixed string if successful, None if encoding fails or no change is needed.
    """
    try:
        # Step 1: Encode back to bytes using CP437 (recovering the original raw bytes)
        raw_bytes = filename.encode("cp437")
        
        # Step 2: Decode using GBK (interpreting those bytes as Chinese)
        decoded = raw_bytes.decode("gbk")
        
        return decoded
    except (UnicodeEncodeError, UnicodeDecodeError):
        # If it fails, the filename likely wasn't garbled in this specific way
        return None

def process_directory(root_dir, dry_run=False):
    """
    Scans directory for non-ASCII filenames and attempts to fix them.
    
    Args:
        root_dir: Directory to scan
        dry_run: If True, only print what would happen without renaming
        
    Returns:
        List of dicts describing the changes
    """
    renamed_records = []
    
    print(f"Scanning '{root_dir}' for non-ASCII filenames...")
    if dry_run:
        print("--- DRY RUN MODE: No files will be renamed ---")
    
    # os.walk yields a 3-tuple: (dirpath, dirnames, filenames)
    for root, dirs, files in os.walk(root_dir):
        for filename in files:
            # Only process if it has non-ascii chars
            if is_non_ascii(filename):
                fixed_name = fix_garbled_filename(filename)
                
                # If we found a fix and it's different from the original
                if fixed_name and fixed_name != filename:
                    original_path = os.path.join(root, filename)
                    new_path = os.path.join(root, fixed_name)
                    
                    # Check for collisions
                    if os.path.exists(new_path):
                        print(f"[SKIP] Target exists: {filename} -> {fixed_name}")
                        continue
                    
                    if not dry_run:
                        try:
                            os.rename(original_path, new_path)
                            renamed_records.append({
                                "original_path": original_path,
                                "new_path": new_path
                            })
                            # Optional: print progress
                            # print(f"[FIXED] {filename} -> {fixed_name}")
                        except OSError as e:
                            print(f"[ERROR] Could not rename {original_path}: {e}")
                    else:
                        print(f"[WOULD FIX] {filename} -> {fixed_name}")
                        renamed_records.append({
                            "original_path": original_path,
                            "new_path": new_path
                        })

    return renamed_records

def main():
    parser = argparse.ArgumentParser(description="Fix filenames garbled by CP437/GBK encoding issues.")
    parser.add_argument("directory", nargs="?", default="subtitle-backup", help="Directory to scan (default: subtitle-backup)")
    parser.add_argument("--dry-run", action="store_true", help="Scan and show potential fixes without renaming files")
    parser.add_argument("--output", default="filename_fix_report.json", help="JSON file to save the change log")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.directory):
        print(f"Error: Directory '{args.directory}' not found.")
        return

    changes = process_directory(args.directory, dry_run=args.dry_run)
    
    # Save records to JSON
    try:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(changes, f, ensure_ascii=False, indent=2)
        
        print("\nProcess complete.")
        if args.dry_run:
            print(f"Found {len(changes)} files that can be fixed.")
        else:
            print(f"Successfully fixed {len(changes)} files.")
        print(f"Report saved to '{args.output}'")
        
    except IOError as e:
        print(f"Error saving report file: {e}")

if __name__ == "__main__":
    main()

