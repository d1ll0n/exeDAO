const styles = (theme) => ({
  toolbar: {
    paddingLeft: 25,
    paddingRight: 25,
    minHeight: 70,
    backgroundColor: theme.palette.palette.white,
  },
  logoWrapper: {
    flexGrow: 1,
  },
  logo: {
    fontSize: 18,
    letterSpacing: 1,
    color: theme.palette.palette.primaryBlue,
  },
  tabsWrapper: {
    flexGrow: 0,
  },
  styledTab: {
    fontSize: 15.2,
    minWidth: 120,
  },
  labelContainer: {
    paddingRight: 5,
  },
});

export default styles;
