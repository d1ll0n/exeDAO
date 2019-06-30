const styles = (theme) => ({
  card: {
    height: 325,
    width: 325,
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
  button: {
    display: 'block',
    '& > span': {
      borderRadius: 4,
    },
  },
  votesBar: {
    borderRadius: 20,
    backgroundColor: theme.palette.palette.green,
  },
  rootVotesBar: {
    borderRadius: 20,
    backgroundColor: theme.palette.palette.red,
  },
  votesLabel: {
    marginTop: 7,
    fontSize: 9,
    color: '#707070',
    letterSpacing: 0.05,
  },
});

export default styles;
