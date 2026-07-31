export default function extractGroupName(
  groupPath: string
): string {
  const normalized = groupPath.replaceAll("\\", "/");

  const file = normalized.slice(
    normalized.lastIndexOf("/") + 1
  );

  return file
    .replace(/\.(json|jsonc)$/i, "")
}