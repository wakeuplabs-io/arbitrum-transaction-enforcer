

export function shortenAddress(add: string) {
    return add.slice(0, 4) + "..." + add.slice(add.length - 4);
  }
  