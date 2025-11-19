import pathlib


if __name__ == "__main__":
    root = pathlib.Path("./subtitle-backup/")

    all_files = list(filter(lambda x: x.is_file(), root.rglob("**/*")))
    useful_file_extensions = {".ass", ".srt", ".ssa", ".sub", ".sup"}
    useful_files = []
    non_useful_files = []
    for file in all_files:
        if file.suffix.lower() in useful_file_extensions:
            useful_files.append(file)
        else:
            non_useful_files.append(file)

    print(
        f"Found {len(useful_files)} useful files and {len(non_useful_files)} non-useful files"
    )
    # delete all non-useful files
    for file in non_useful_files:
        file.unlink(missing_ok=True)
        print(f"Deleted {file}")

    print("Done")
