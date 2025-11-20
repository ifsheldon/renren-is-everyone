import os
import urllib.parse
from datetime import datetime
import math

# Configuration
BASE_URL = "https://renren.alittlemagic.studio"
SOURCE_DIR = "./subtitle-backup"
OUTPUT_DIR = "./renren/public"
SITEMAP_DIR_NAME = "sitemaps"  # Subdirectory for split sitemaps in public/
ITEMS_PER_SITEMAP = 40000  # Safe limit (max 50,000)
CHANGE_FREQ = "yearly"

def should_process(name):
    """
    Filter out hidden files and specific system files.
    """
    return not name.startswith(".") and name != ".DS_Store"

def generate_sitemap_content(urls):
    """
    Generates the XML content for a single sitemap file.
    """
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    for url in urls:
        xml.append('  <url>')
        xml.append(f'    <loc>{url}</loc>')
        xml.append(f'    <changefreq>{CHANGE_FREQ}</changefreq>')
        xml.append('  </url>')
    xml.append('</urlset>')
    return "\n".join(xml)

def generate_sitemap_index(sitemap_files):
    """
    Generates the XML content for the sitemap index file.
    """
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    today = datetime.now().strftime("%Y-%m-%d")
    for filename in sitemap_files:
        xml.append('  <sitemap>')
        # The location in sitemap index must be the full URL
        xml.append(f'    <loc>{BASE_URL}/{SITEMAP_DIR_NAME}/{filename}</loc>')
        xml.append(f'    <lastmod>{today}</lastmod>')
        xml.append('  </sitemap>')
    xml.append('</sitemapindex>')
    return "\n".join(xml)

def main():
    urls = []
    
    if not os.path.exists(SOURCE_DIR):
        print(f"Error: Source directory '{SOURCE_DIR}' not found.")
        return

    print(f"Scanning files in {SOURCE_DIR}...")
    
    # Walk the directory
    for root, dirs, files in os.walk(SOURCE_DIR):
        # Modify dirs in-place to skip hidden directories
        dirs[:] = [d for d in dirs if should_process(d)]
        dirs.sort() # Ensure consistent order
        files.sort()
        
        # Calculate relative path from source dir
        rel_path = os.path.relpath(root, SOURCE_DIR)
        if rel_path == ".":
            rel_path = ""
            
        # Add directory page itself if not root and we want to index directories
        # (Users typically want to index the content, but directories are also pages in this app)
        if rel_path:
            parts = rel_path.split(os.sep)
            encoded_path = "/".join(urllib.parse.quote(p) for p in parts)
            urls.append(f"{BASE_URL}/file/{encoded_path}")

        for file in files:
            if should_process(file):
                if rel_path:
                    parts = rel_path.split(os.sep) + [file]
                else:
                    parts = [file]
                
                encoded_path = "/".join(urllib.parse.quote(p) for p in parts)
                urls.append(f"{BASE_URL}/file/{encoded_path}")
    
    print(f"Found {len(urls)} URLs.")
    
    if len(urls) == 0:
        print("No URLs found. Exiting.")
        return

    # Split into chunks
    num_sitemaps = math.ceil(len(urls) / ITEMS_PER_SITEMAP)
    sitemap_files = []
    
    # Ensure output directories exist
    sitemaps_path = os.path.join(OUTPUT_DIR, SITEMAP_DIR_NAME)
    os.makedirs(sitemaps_path, exist_ok=True)
    
    print(f"Generating {num_sitemaps} sitemaps in {sitemaps_path}...")
    
    for i in range(num_sitemaps):
        chunk = urls[i * ITEMS_PER_SITEMAP : (i + 1) * ITEMS_PER_SITEMAP]
        filename = f"sitemap-{i+1}.xml"
        content = generate_sitemap_content(chunk)
        
        output_file = os.path.join(sitemaps_path, filename)
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)
        
        sitemap_files.append(filename)
        print(f"Written {filename} ({len(chunk)} URLs)")

    # Generate index
    index_content = generate_sitemap_index(sitemap_files)
    index_path = os.path.join(OUTPUT_DIR, "sitemap.xml")
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(index_content)
    
    print(f"Generated sitemap index at {index_path}")

if __name__ == "__main__":
    main()

