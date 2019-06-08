const styles = (theme) => ({
  card: {
    height: 420,
    width: 325,
    boxShadow: ' 0px 1px 3px 0px #D4D4D5, 0px 0px 0px 1px #D4D4D5',
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
