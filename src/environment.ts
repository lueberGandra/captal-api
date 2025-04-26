export function isServerlessOffline() {
  return process.env.IS_LOCAL === 'true';
}
