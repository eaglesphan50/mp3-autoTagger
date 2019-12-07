const ID3Writer = require('browser-id3-writer');
const fs = require('fs');

let untaggedDirectory = process.argv[2];
let taggedDirectory = process.argv[3];

if (!untaggedDirectory || !taggedDirectory) {
	console.log('Usage: node autoTagger.js <untagged music directory> <tagged music directory>');
	return;
}

// read directory
let directoryBuffer = fs.readdirSync('./' + untaggedDirectory, { withFileTypes: true });

// for each file in the directory edit tags
for (let i = 0; i < directoryBuffer.length; i++) {
	let badStr = directoryBuffer[i].name;

	console.log(badStr);
	
	// get rid of xilisoft extra shit
	let goodStr = badStr.split('[160K]')[0];

	// get rid of all unnecessary youtube shit
	// TODO: build real regex here
	let title;
	try {
		title = goodStr.split(/ \- | – /)[1]
			.replace(/\(Lyrics\)/g, '')
			.replace(/\[Lyrics\]/g, '')
			.replace(/\(Audio\)/g, '')
			.replace(/\[Audio\]/g, '')
			.replace(/\(Official Lyric Video\)/g, '')
			.replace(/\[Official Lyric Video\]/g, '')
			.replace(/\(Lyric Video\)/g, '')
			.replace(/\[Lyric Video\]/g, '')
			.replace(/Lyrics Video/g, '')
			.replace(/\(Lyrics Video\)/g, '')
			.replace(/\[Lyrics Video\]/g, '')
			.replace(/\(Proximity Release\)/g, '')
			.replace(/\[NCS Release\]/g, '')
			.replace(/\(Official Music Video\)/g, '')
			.replace(/\[Official Music Video\]/g, '')
			.replace(/\(Official Video\)/g, '')
			.replace(/\(Official Audio\)/g, '')
			.replace(/\[Official Video\]/g, '');
	} catch(e) {
		console.log('ERROR: no dash in song title: ' + badStr)
		return;
	}

	// get remixing / featuring artist out of song name
	if (title.toLowerCase().includes('remix') || title.toLowerCase().includes('ft') || title.toLowerCase().includes('feat')) {
		// TODO
	}

	// get artists
	let artists = goodStr.split(/ \- | – /)[0];
	let artistArray = artists.split(/ ft\. | feat\. | & | x | X |, |\/| \/ /);

	// TODO: get album art
	// use google api and artist/title to get url
	// use <something> to convert the url to a buffer
	let coverArrayBuffer;

	// add tags
	let songBuffer = fs.readFileSync(untaggedDirectory + '/' + badStr);
	const writer = new ID3Writer(songBuffer);
	writer.setFrame('TIT2', title)
	      .setFrame('TPE1', artistArray)
		  .setFrame('TCON', ['edm']);
		//.setFrame('APIC', {  add album art here
		// 	type: 3,
		// 	data: coverArrayBuffer,
		// 	description: '',
		// 	useUnicodeEncoding: false
		//}
	writer.addTag();

	// write file to output directory
	let taggedSongBuffer = Buffer.from(writer.arrayBuffer);
	fs.writeFileSync(taggedDirectory + '/' + badStr, taggedSongBuffer);
}

console.log('Done!');
