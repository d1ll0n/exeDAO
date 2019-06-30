const styles = (theme) => ({
  paper: {
    width: '100%',
    height: '100%',
    paddingBottom: 15
  },
  votesBar: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: theme.palette.palette.red,
  },
  rootVotesBar: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: theme.palette.palette.green,
  },
  votesLabel: {
    marginTop: 7,
    fontSize: 9,
    color: '#707070',
    letterSpacing: 0.05,
  },
});

export default styles;