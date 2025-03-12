export function parseToken(token: string) {
  const res = token.split(' ');
  if (res.length < 2) throw new Error('format error');
  switch (res[0]) {
    case 'Bearer':
      return res[1];
    default:
      throw new Error('format error');
  }
}

export function addLeaderZeros(str, length = 18) {
  if (!str || str == '0.0' || str == '0') return str;

  if (str.length === length) {
    return `0.${str}`;
  } else if (str.length > length) {
    return str.substr(0, length + 2);
  } else {
    return str;
  }
}

export const uuidv4RegExp =
  /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
export const isUUIDv4 = (userId: string) => uuidv4RegExp.test(userId);
