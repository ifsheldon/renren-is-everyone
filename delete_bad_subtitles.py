import pathlib
from tqdm.auto import tqdm

if __name__ == "__main__":
    root = pathlib.Path("./subtitle-backup/")

    all_files = list(filter(lambda x: x.is_file(), root.rglob("**/*")))
    subtitle_extensions = {".ass", ".srt", ".ssa", ".sub", ".sup"}
    subtitle_files = [f for f in all_files if f.suffix.lower() in subtitle_extensions]

    for file in tqdm(subtitle_files):
        with open(file, "r", encoding="utf-8") as f:
            content = f.read()

        line_num = content.count("\n")
        if line_num < 100:
            file.unlink(missing_ok=True)
            print(f"Removed {file} because it has less than 100 lines")

        zimu_count = content.count("字幕")
        percent = zimu_count / line_num
        if percent >= 0.125:
            file.unlink(missing_ok=True)
            print(f"Removed {file} because it has more than 12.5% of lines are '字幕'")
