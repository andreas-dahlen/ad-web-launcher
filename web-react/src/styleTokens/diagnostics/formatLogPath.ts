
export default function formatLogPath(file: string) {
  return file
    .replaceAll("\\", "/")
    .split("/")
    .slice(-2)
    .join("/");
}