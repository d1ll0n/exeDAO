const TOOLBAR_HEIGHT = 70;

const styles = (theme) => ({
  root: {
    display: 'flex',
    backgroundColor: 'white',
    height: '100vh',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    backgroundColor: 'transparent',
    boxShadow: 'none',
  },
  content: {
    width: '100%',
    marginTop: `${TOOLBAR_HEIGHT}px`,
    height: `calc(100vh - ${TOOLBAR_HEIGHT}px)`, //avoids scroll caused by marginTop
  },
});

export default styles;
