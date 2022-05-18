//ummmmm  what do we pass in?
//  the cloud images?  size?  look at size of images and use that as size 1?
//  location?  Do we just create relative to the images?
//  max floaties - the mini-er versions of cloud on each level..
//  do we pass in the images?

class Cloud {
	constructor(size, layers, maxFloaties) {
		this.size = size;
		this.numLayers = layers > 3 ? 3 : layers < 1 ? 0 : layers;
		this.maxFloaties = maxFloaties;
	}

	//we need to build the cloud...
	build() {

	}

}