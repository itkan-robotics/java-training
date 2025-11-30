import json
import os
from pathlib import Path

def find_json_files(directory):
    """Recursively find all JSON files in a directory."""
    json_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.json'):
                json_files.append(os.path.join(root, file))
    return json_files

def find_matches(file_path):
    """Find consecutive text/code sections with same title."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'sections' not in data or not isinstance(data['sections'], list):
            return []
        
        matches = []
        for i in range(len(data['sections']) - 1):
            current = data['sections'][i]
            next_section = data['sections'][i + 1]
            
            if (current.get('type') == 'text' and 
                current.get('title') and
                next_section.get('type') == 'code' and
                next_section.get('title') == current.get('title')):
                matches.append({
                    'index': i,
                    'title': current['title'],
                    'text_content': current.get('content', '')[:100] + '...',
                    'code_content': next_section.get('content', '')[:100] + '...'
                })
        
        return matches
    
    except Exception as e:
        return []

def main():
    data_dir = 'data/frc'
    json_files = find_json_files(data_dir)
    
    print(f"Searching {len(json_files)} files in {data_dir}...\n")
    
    total_matches = 0
    files_with_matches = []
    
    for file_path in json_files:
        matches = find_matches(file_path)
        if matches:
            files_with_matches.append((file_path, matches))
            total_matches += len(matches)
    
    print(f"Found {total_matches} matches in {len(files_with_matches)} files:\n")
    
    for file_path, matches in files_with_matches:
        rel_path = os.path.relpath(file_path)
        print(f"{rel_path}:")
        for match in matches:
            print(f"  - Index {match['index']}: '{match['title']}'")
        print()

if __name__ == '__main__':
    main()

