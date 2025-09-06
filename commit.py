import requests
import os
import re
from urllib.parse import urlparse

# GitHub API base URL
GITHUB_API_BASE_URL = "https://api.github.com"

# Get GitHub Token from environment variable or replace with your token
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN") 
# If you don't want to use an environment variable, uncomment the line below 
# and replace "YOUR_GITHUB_TOKEN_HERE" with your actual token.
# GITHUB_TOKEN = "YOUR_GITHUB_TOKEN_HERE" 

def parse_github_url(repo_url):
    """
    Parses a GitHub repository URL to extract owner and repository name.
    e.g., "https://github.com/octocat/Spoon-Knife" -> ("octocat", "Spoon-Knife")
    """
    try:
        parsed_url = urlparse(repo_url)
        path_parts = [part for part in parsed_url.path.strip('/').split('/') if part]

        # Handle various GitHub URL formats
        if parsed_url.netloc == 'github.com' and len(path_parts) >= 2:
            owner = path_parts[0]
            repo = path_parts[1].replace('.git', '')
        elif len(path_parts) >= 2: # For URLs like /owner/repo (less common but good to handle)
            owner = path_parts[0]
            repo = path_parts[1].replace('.git', '')
        else:
            print(f"Error: Could not parse owner and repo from URL: {repo_url}")
            return None, None
        
        return owner, repo
    except Exception as e:
        print(f"Error parsing URL '{repo_url}': {e}")
        return None, None

def parse_patch_content(patch_content):
    """
    Parses the Git diff (patch) content to provide a human-readable summary
    of changes, indicating line numbers and modifications.
    """
    if not patch_content:
        return "  (No detailed patch content available for this file, e.g., binary or large file)"

    lines = patch_content.split('\n')
    output_lines = []
    
    # Track line numbers for the original (old) and new files
    old_line_tracker = 0 
    new_line_tracker = 0
    
    for line in lines:
        # Ignore diff header lines like '--- a/file' and '+++ b/file'
        if line.startswith('--- a/') or line.startswith('+++ b/'):
            continue
        # Hunk header: @@ -old_start,old_count +new_start,new_count @@
        elif line.startswith('@@'):
            match = re.search(r'@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@', line)
            if match:
                old_line_tracker = int(match.group(1)) # Starting line number in old file
                new_line_tracker = int(match.group(2)) # Starting line number in new file
            output_lines.append(f"  --- Diff Hunk: {line} ---")
        elif line.startswith('+'):
            # Addition
            output_lines.append(f"  Line {new_line_tracker}: ADDED -> '{line[1:].strip()}'")
            new_line_tracker += 1
        elif line.startswith('-'):
            # Deletion
            output_lines.append(f"  Line {old_line_tracker}: DELETED -> '{line[1:].strip()}'")
            old_line_tracker += 1
        elif line.startswith(' '):
            # Context line (unchanged)
            output_lines.append(f"  Line {old_line_tracker}/{new_line_tracker}: CONTEXT -> '{line[1:].strip()}'")
            old_line_tracker += 1
            new_line_tracker += 1
        # Other lines (e.g., \ No newline at end of file) are ignored for this output
            
    return "\n".join(output_lines)


def get_commit_changes(repo_url, commit_id):
    """
    Fetches and processes the changes made in a specific commit for a GitHub repository.
    """
    owner, repo = parse_github_url(repo_url)
    if not owner or not repo:
        return

    print(f"\nFetching changes for commit '{commit_id}' in '{owner}/{repo}'...")

    headers = {
        "Accept": "application/vnd.github.v3+json",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"
    else:
        print("Warning: GITHUB_TOKEN not set. Rate limits might be hit quickly for unauthenticated requests.")

    api_url = f"{GITHUB_API_BASE_URL}/repos/{owner}/{repo}/commits/{commit_id}"

    try:
        response = requests.get(api_url, headers=headers)
        response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
        commit_data = response.json()

        if 'files' not in commit_data or not commit_data['files']:
            print(f"No file changes found for commit '{commit_id}'.")
            return

        # Store file info for later selection and sorting
        all_files_info = sorted(commit_data['files'], key=lambda x: x['filename'])
        
        print(f"\n--- Files changed in Commit {commit_id} ---")
        for i, file_info in enumerate(all_files_info):
            print(f"{i+1}. {file_info['filename']} (Status: {file_info['status']})")
        
        while True:
            selection = input(
                "\nEnter the numbers of files you want to view (e.g., 1,3,5) or 'all' for all files, or 'q' to quit: "
            ).strip().lower()

            if selection == 'q':
                print("Exiting without saving changes.")
                return
            
            selected_indices = []
            if selection == 'all':
                selected_indices = list(range(len(all_files_info)))
            else:
                try:
                    parts = selection.split(',')
                    for part in parts:
                        idx = int(part.strip()) - 1 # Convert to 0-based index
                        if 0 <= idx < len(all_files_info):
                            selected_indices.append(idx)
                        else:
                            print(f"Warning: File number {part} is out of range. Skipping.")
                    selected_indices = sorted(list(set(selected_indices))) # Remove duplicates and sort
                except ValueError:
                    print("Invalid input. Please enter numbers separated by commas, 'all', or 'q'.")
                    continue
            
            if not selected_indices:
                print("No valid files selected. Please try again.")
            else:
                break # Valid selection, proceed

        output_filename = "changes.txt"
        with open(output_filename, 'w', encoding='utf-8') as f_out:
            f_out.write(f"--- Changes for Commit {commit_id} in {owner}/{repo} ---\n\n")
            print(f"\nWriting selected changes to '{output_filename}'...")

            for i, idx in enumerate(selected_indices):
                file_info = all_files_info[idx]
                filename = file_info.get('filename')
                status = file_info.get('status')
                patch = file_info.get('patch')

                header = f"File {i+1}/{len(selected_indices)}: {filename} (Status: {status})"
                f_out.write(f"{header}\n")
                f_out.write("-" * len(header) + "\n")
                
                if status == 'added':
                    f_out.write("  This file was added.\n")
                    f_out.write(parse_patch_content(patch) + "\n")
                elif status == 'removed':
                    f_out.write("  This file was removed.\n")
                    f_out.write(parse_patch_content(patch) + "\n")
                elif status == 'modified':
                    f_out.write("  This file was modified:\n")
                    f_out.write(parse_patch_content(patch) + "\n")
                elif status == 'renamed':
                    previous_filename = file_info.get('previous_filename')
                    f_out.write(f"  This file was renamed from '{previous_filename}'.\n")
                    f_out.write(parse_patch_content(patch) + "\n")
                else:
                    f_out.write(f"  Unknown status: {status}\n")
                    f_out.write(parse_patch_content(patch) + "\n")
                f_out.write("\n" + "="*80 + "\n\n") # Separator for files

            print(f"\nSuccessfully wrote selected changes to '{output_filename}'.")

    except requests.exceptions.HTTPError as e:
        print(f"HTTP Error fetching commit details: {e}")
        if e.response.status_code == 404:
            print(f"  Repository or Commit ID not found. Please check the URL and commit ID.")
        elif e.response.status_code == 403:
            print(f"  Forbidden. This might be due to rate limits or insufficient token permissions.")
    except requests.exceptions.ConnectionError as e:
        print(f"Connection Error: {e}")
    except requests.exceptions.Timeout as e:
        print(f"Timeout Error: {e}")
    except requests.exceptions.RequestException as e:
        print(f"An unexpected error occurred: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("GitHub Commit Change Viewer")
    print("----------------------------")

    repo_url = input("Enter GitHub repository URL (e.g., https://github.com/octocat/Spoon-Knife): ").strip()
    commit_id = input("Enter commit ID (SHA): ").strip()

    if not repo_url or not commit_id:
        print("Repository URL and Commit ID cannot be empty.")
    else:
        get_commit_changes(repo_url, commit_id)

    print("\nScript finished.")
