import pathlib

root = pathlib.Path("./subtitle-backup/")

if __name__ == "__main__":
    # Delete all .DS_Store files
    for ds_store in root.rglob(".DS_Store"):
        print(f"Deleting .DS_Store: {ds_store}")
        ds_store.unlink()
    
    # Delete all files that are <= 10 bytes
    for item in root.rglob("*"):
        if item.is_file() and item.stat().st_size <= 10:
            print(f"Deleting small file: {item} ({item.stat().st_size} bytes)")
            item.unlink()
    
    # Delete empty directories (from deepest to shallowest)
    for item in sorted(root.rglob("*"), key=lambda p: len(p.parts), reverse=True):
        if item.is_dir():
            try:
                item.rmdir()  # Only succeeds if directory is empty
                print(f"Deleted empty directory: {item}")
            except OSError:
                pass  # Directory not empty, skip