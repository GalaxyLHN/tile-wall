import '@material/web/typography/md-typescale-styles.css';
import './style.css';
import '@material/web/slider/slider.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';

import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<App />);