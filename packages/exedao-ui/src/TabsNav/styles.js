const styles = (theme) => ({
  flexContainer: {
    width: '100%',
    display: 'inline-flex',
    borderBottom: theme.palette.palette.primaryBlue,
    paddingRight: 15,
    paddingLeft: 15,
  },
  indicator: {
    backgroundColor: theme.palette.palette.primaryBlue,
  },
  styledTab: {
    fontSize: 15.2,
    minWidth: 115,
    color: theme.palette.palette.primaryBlue,
  },
  labelContainer: {
    paddingRight: 0,
    paddingLeft: 0,
  },
});

export default styles;
