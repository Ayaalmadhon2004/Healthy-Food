import { I18n } from 'i18n';
import path from 'path';

const i18n = new I18n();

i18n.configure({
    locales:['ar','en'],
    directory:path.join(process.cwd(),'locales'),
    defaultLocale:'ar',
    objectNotation:true,
    updateFiles:false,
    cookie:'lang',
});
export default i18n;
