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

def process_file(file_path):
    """Process a single JSON file to combine matching text/code sections."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'sections' not in data or not isinstance(data['sections'], list):
            return {'modified': False, 'count': 0}
        
        modified = False
        count = 0
        new_sections = []
        i = 0
        
        while i < len(data['sections']):
            current = data['sections'][i]
            
            # Check if we have a next section
            if i + 1 < len(data['sections']):
                next_section = data['sections'][i + 1]
                
                # Check if current is "text" and next is "code" with same title
                if (current.get('type') == 'text' and 
                    current.get('title') and
                    next_section.get('type') == 'code' and
                    next_section.get('title') == current.get('title')):
                    
                    # Combine them
                    combined = {
                        'type': 'code',
                        'title': current['title'],
                        'description': current.get('content', ''),
                        'content': next_section.get('content', '')
                    }
                    # Preserve other fields from code section (like language)
                    for key, value in next_section.items():
                        if key not in ['type', 'title', 'content']:
                            combined[key] = value
                    
                    new_sections.append(combined)
                    modified = True
                    count += 1
                    i += 2  # Skip both sections
                    continue
                
                # Check if current is "text" and next is "code-tabs" with same title
                if (current.get('type') == 'text' and 
                    current.get('title') and
                    next_section.get('type') == 'code-tabs' and
                    next_section.get('title') == current.get('title')):
                    
                    # Combine them - use text content as description
                    combined = {
                        'type': 'code-tabs',
                        'title': current['title'],
                        'description': current.get('content', ''),
                        'tabs': next_section.get('tabs', [])
                    }
                    # Preserve other fields from code-tabs section (but remove 'content' if it exists)
                    for key, value in next_section.items():
                        if key not in ['type', 'title', 'tabs', 'content', 'description']:
                            combined[key] = value
                    
                    new_sections.append(combined)
                    modified = True
                    count += 1
                    i += 2  # Skip both sections
                    continue
            
            # Otherwise, just add the current section
            new_sections.append(current)
            i += 1
        
        if modified:
            data['sections'] = new_sections
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write('\n')  # Add newline at end
        
        return {'modified': modified, 'count': count}
    
    except Exception as e:
        return {'modified': False, 'count': 0, 'error': str(e)}

def main():
    data_dir = 'data/frc'
    
    if not os.path.exists(data_dir):
        print(f"Data directory not found: {data_dir}")
        return
    
    json_files = find_json_files(data_dir)
    print(f"Found {len(json_files)} JSON files to process...\n")
    
    if len(json_files) == 0:
        print("No JSON files found. Exiting.")
        return
    
    total_modified = 0
    total_combined = 0
    errors = []
    
    for file_path in json_files:
        result = process_file(file_path)
        if result.get('error'):
            errors.append(f"{file_path}: {result['error']}")
        elif result['modified']:
            total_modified += 1
            total_combined += result['count']
            rel_path = os.path.relpath(file_path)
            print(f"✓ {rel_path} - Combined {result['count']} pair(s)")
    
    print(f"\nSummary:")
    print(f"  Files modified: {total_modified}")
    print(f"  Total pairs combined: {total_combined}")
    
    if errors:
        print(f"\nErrors ({len(errors)}):")
        for error in errors[:10]:  # Show first 10 errors
            print(f"  {error}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more errors")

if __name__ == '__main__':
    main()

