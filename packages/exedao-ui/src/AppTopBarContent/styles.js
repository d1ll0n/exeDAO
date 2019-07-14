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
      opacity: 0.6,
    },
    '&:hover, &:hover > p, &:hover > div': {
      transition: 'all 0.2s ease',
    }
  },
  otherLogoWrapper: {
    '&:nth-child(2)': {
      marginLeft: 50
    },
    marginLeft: 25
  },
  otherLogo: {
    maxHeight: 40,
    fontSize: 18,
    letterSpacing: 1,
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.6,
    },
    '&:hover, &:hover > p, &:hover > div': {
      transition: 'all 0.2s ease',
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
