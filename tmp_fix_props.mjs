import fs from 'fs';
import path from 'path';

const pagePath = path.join(process.cwd(), 'src/app/listing/[id]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(/l\.address_unit/g, 'l.unit_number');
content = content.replace(/l\.property_sub_type/g, 'l.property_type');
content = content.replace(/l\.lot_size_area/g, 'l.lot_size');
content = content.replace(/l\.data_source/g, 'l.board');
content = content.replace(/l\.virtual_tour_url/g, 'undefined');
content = content.replace(/l\.community_name/g, 'l.neighbourhood');
// Fix any other sneaky mappings
content = content.replace(/l\.bedrooms_total/g, 'l.bedrooms');
content = content.replace(/l\.bathrooms_total/g, 'l.bathrooms');
content = content.replace(/l\.living_area/g, 'l.sqft');

fs.writeFileSync(pagePath, content);
console.log('Fixed page params.');
