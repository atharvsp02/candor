export const REPO_URL = 'https://github.com/atharvsp02/candor';
export const CONTRACT_SOURCE_URL = `${REPO_URL}/blob/main/contracts/candor.compact`;
export const ROSTER_CAPACITY = 1024;
export const OPTION_LABELS = ['Yes', 'No', 'Abstain'];
export const OPTION_COLORS = ['#d95926', '#3987e5', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];

export const optionLabel = (index: number) => OPTION_LABELS[index] ?? `Option ${index + 1}`;

export const middle = (value: string, head = 6, tail = 4) =>
  value.length > head + tail + 1 ? `${value.slice(0, head)}…${value.slice(-tail)}` : value;

export const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part * 100) / whole) : 0);

export const clock = (date: Date) =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const hostOf = (uri: string) => {
  try {
    return new URL(uri).host;
  } catch {
    return uri;
  }
};
