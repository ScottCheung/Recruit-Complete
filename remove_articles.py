
import os
import re

def remove_articles_links(directory):
    # Regex to match the specific list item containing the Articles link
    # We use [\s\S]*? to match across lines non-greedily
    # The pattern looks for:
    # 1. <li ...>
    # 2. Optional whitespace
    # 3. <a ... href="...articles/...">
    # 4. Content inside <a> (like the svg)
    # 5. "Articles" text
    # 6. </a>
    # 7. </li>
    
    pattern = re.compile(
        r'<li[^>]*>\s*<a[^>]*href="[^"]*articles/?"[^>]*>[\s\S]*?Articles</a>\s*</li>',
        re.IGNORECASE
    )

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    new_content, count = pattern.subn('', content)
                    
                    if count > 0:
                        print(f"Removing {count} 'Articles' link(s) from {filepath}")
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    target_dir = "/Users/scottcheung/Desktop/Bluesky Projects/Recruit Complete"
    remove_articles_links(target_dir)
