const styles = (theme) => ({
  base: {
      marginTop: 15,
  },
  token: {
      marginTop: 15,
      width: '100%',
  },
  tokenItem: {
    margin: 10,
    padding: 10
  },
  tokenPrice: {
    marginTop: 10
  },
  tokenCard: {
      height: 150,
      width: 250,
      padding: 10,
      boxShadow: ' 0px 1px 3px 0px #D4D4D5, 0px 0px 0px 1px #D4D4D5',
      border: 'solid 1px rgba(0, 0, 0, 0.12)',
      cursor: 'pointer',
      '&:hover': {
        boxShadow:
          '0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 6px 10px 0 rgba(0, 0, 0, 0.14)',
      },
      '&:hover, &:hover > p, &:hover > div': {
        transition: 'all 0.3s ease',
      },
    },
});

export default styles;