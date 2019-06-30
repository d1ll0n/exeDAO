const defaultTransform = (oldItem, newItem) => ({ ...oldItem, ...newItem })

export const updateItem = (arr, item, matchProperty, transform = defaultTransform) => arr.map((_item) => {
  if (_item[matchProperty] == item[matchProperty]) return transform(_item, item)
  return _item
})