
cd $home
rm package-lock.json
npm install --force
echo "DEPLOYMENT SCRIPT"
echo $1  
ng build --configuration=ladyboss_$1 --aot --output-hashing=all --output-path=/var/www/frontend/ --delete-output-path=true
#test 1234567
echo "RewriteEngine on" >> .htaccess
echo "RewriteCond %{REQUEST_FILENAME} -s [OR]" >> .htaccess
echo "RewriteCond %{REQUEST_FILENAME} -l [OR]" >> .htaccess
echo "RewriteCond %{REQUEST_FILENAME} -d" >> .htaccess
echo "RewriteRule ^.*$ - [NC,L]" >> .htaccess
echo "RewriteRule ^help$ https://ladyboss3844.zendesk.com/hc/en-us [R=302,L]" >> .htaccess
echo "RewriteRule ^(.*) /index.html [NC,L]" >> .htaccess

mv .htaccess /var/www/frontend/
#npm run-script demo_build -- --aot --output-hashing=all --output-path=/var/www/frontend/ --delete-output-path=true
#ng build --aot --configuration $1 --delete-output-path=true --output-hashing=all --output-path=/var/www/frontend/
sudo systemctl restart apache2
