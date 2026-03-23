export function formatTaskPriority(priority: number): string {
  switch (priority) {
    case 0:
      return "Baja";
    case 1:
      return "Media";
    case 2:
      return "Alta";
    default:
      return String(priority);
  }
}

export function formatTaskStatus(status: number): string {
  switch (status) {
    case 0:
      return "Por hacer";
    case 1:
      return "En progreso";
    case 2:
      return "Hecha";
    default:
      return String(status);
  }
}
