import { createMuiTheme } from '@material-ui/core/styles';
import createTypography from './typography';
import createColors from './colors';

const defaultTheme = {
  palette: createColors(),
  typography: createTypography(),
};

const theme = createMuiTheme(defaultTheme);

export default theme;
