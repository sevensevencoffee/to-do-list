import './styles.css';
import { mainContentDom } from './modules/mainContentDom';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    new mainContentDom();
});