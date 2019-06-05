import React from 'react';
import PropTypes from 'prop-types';
import { Paper, Typography, Grid } from '@material-ui/core';

const getTitles = (title, subheader, classes) => {
  const titleIsString = typeof title === 'string';
  if (titleIsString) {
    return (
      <Grid
        style={{ height: '100%' }}
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">{subheader}</Typography>
        </Grid>
      </Grid>
    );
  }
  return title;
};
// TODO matt: add loading skeletons
const EntryPageCard = ({ classes, title, subheader, loading }) => {
  return (
    <Paper className={classes.card}>
      <div className={classes.contentWrapper}>
        {loading ? null : getTitles(title, subheader, classes)}
      </div>
    </Paper>
  );
};

EntryPageCard.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  subheader: PropTypes.string,
  loading: PropTypes.bool,
};

EntryPageCard.defaultProps = {
  title: '',
  subheader: '',
};

export default EntryPageCard;
