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
    maxHeight: 70,
    fontSize: 18,
    letterSpacing: 1,
    color: theme.palette.palette.primaryBlue,
    cursor: 'pointer',
    '&:hover': {
      boxShadow:
        '0 1px 2px -1px rgba(0, 0, 0, 0.2), 0 1px 14px 0 rgba(0, 0, 0, 0.12), 0 6px 10px 0 rgba(0, 0, 0, 0.14)',
    },
    '&:hover, &:hover > p, &:hover > div': {
      transition: 'all 0.3s ease',
    },
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
