set -e 
npm --version
node --version
#npm install --only=dev
npm install 
npm run-script demo_build -- --aot --output-hashing=all --output-path=dist
npm run-script prod_build -- --aot --output-hashing=all --output-path=dist2
echo "staging:" 
cp -R $LOCAL_PATH/dist $LOCAL_PATH/docker/dist
cp -R $LOCAL_PATH/dist2 $LOCAL_PATH/docker/dist2
docker login $DOCKER_HUB_URL -u $DOCKER_HUB_USER -p $DOCKER_HUB_PASSWORD
docker build -f $LOCAL_PATH/docker/Dockerfile -t $DOCKER_HUB_URL/pruvitventures/shopketo-web:$RELEASE_VERSION-demo $LOCAL_PATH/docker
docker build -f $LOCAL_PATH/docker/Dockerfile.prod -t $DOCKER_HUB_URL/pruvitventures/shopketo-web:$RELEASE_VERSION $LOCAL_PATH/docker
docker push $DOCKER_HUB_URL/pruvitventures/shopketo-web:$RELEASE_VERSION-demo
docker push $DOCKER_HUB_URL/pruvitventures/shopketo-web:$RELEASE_VERSION
git tag v$RELEASE_VERSION
git push origin v$RELEASE_VERSION