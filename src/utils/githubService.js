/**
 * Helper to get the GitHub Token from environment variables safely.
 */
const getGitHubHeaders = () => {
  const token = import.meta.env.VITE_GITHUB_TOKEN || "";
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  } else {
    console.warn("WARNING: Running without VITE_GITHUB_TOKEN. Anonymous rate limits apply.");
  }

  return headers;
};

/**
 * Parses a standard GitHub repository URL into owner and repo name.
 * Example: "https://github.com/Pooja-CG/FlowForge-AI" -> { owner: "Pooja-CG", repo: "FlowForge-AI" }
 */
export const parseGitHubUrl = (url) => {
  try {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  } catch {
    return null;
  }
};

export const fetchRepoTree = async (owner, repo) => {
  let branch = 'main'; 
  let response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`);

  if (response.status === 404) {
    branch = 'master';
    response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch branch structure. Status: ${response.status}`);
  }

  const branchData = await response.json();
  const treeSha = branchData.commit.commit.tree.sha;

  const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`);
  if (!treeResponse.ok) {
    throw new Error(`Failed to fetch repository tree. Status: ${treeResponse.status}`);
  }

  const treeData = await treeResponse.json();
  return treeData.tree.filter(file => 
    file.type === 'blob' && 
    !file.path.match(/\.(png|jpe?g|gif|ico|pdf|zip|mp4|woff2?|eot|ttf)$/i)
  );
};

export const fetchFileContent = async (owner, repo, path) => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
  if (!response.ok) throw new Error(`Failed to fetch file content: ${path}`);
  const data = await response.json();
  return atob(data.content.replace(/\n/g, ''));
};
export const fetchFileContent = async (owner, repo, filePath, branch = 'main') => {
  const headers = getGitHubHeaders();
  // Override the response type headers to fetch raw text data bytes directly instead of a Base64 JSON package object
  headers['Accept'] = 'application/vnd.github.v3.raw';

  try {
    // Attempt fallback lookups for branch safety tracking
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, { headers });
    
    if (!res.ok && branch === 'main') {
      const fallbackRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=master`, { headers });
      if (fallbackRes.ok) return await fallbackRes.text();
    }

    if (!res.ok) throw new Error(`Could not access file resource at ${filePath}. Status: ${res.status}`);
    
    return await res.text();
  } catch (error) {
    console.error(`Error reading file payload at ${filePath}:`, error);
    throw error;
  }
};