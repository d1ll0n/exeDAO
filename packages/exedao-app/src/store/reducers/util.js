const defaultTransform = (oldItem, newItem) => ({ ...oldItem, ...newItem })

export const updateItem = (arr, item, matchProperty, transform = defaultTransform) => {
  let found = false;
  const newArr = arr.map((_item) => {
    if (_item[matchProperty] == item[matchProperty]) {
      found = true;
      return transform(_item, item);
    }
    return _item
  });
  if (!found) newArr.push(item);
  return newArr;
}

export const updateItems = (arr, items, matchProperty, transform = defaultTransform) => {
  return items.reduce((newArr, item) => updateItem(newArr, item, matchProperty, transform), arr);
}