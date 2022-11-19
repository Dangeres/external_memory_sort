let fs = require('fs');
// let crypto = require('crypto');

const input_file_name = 'test.txt';
const output_file_name = 'out.txt';
const temp_dir = 'temp_files/';
const ONE_MB = 1024 * 1024;
const CHUNK_SIZE =  10 * ONE_MB;
// const CHUNK_SIZE =  2 * 103;

Date.prototype.toUnixTime = function() { return this.getTime() /1000 | 0 };
Date.time = function() { return new Date().toUnixTime(); }


function memoryUsagePrint() {
    return process.memoryUsage().heapUsed / ONE_MB;
}


function generateRandomString(myLength) {
    const chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";

    const randomArray = Array.from(
        { length: myLength },
        (v, k) => chars[Math.floor(Math.random() * chars.length)]
    );

    return randomArray.join("");
};


function generateFileName() {
    return generateRandomString(30) + ".txt";
    // return crypto.createHash('sha-256').update(String(Date.now())).digest('hex') + ".txt";
}


function readChunkSync(
    filePath,
    {length, startPosition},
) {
	let buffer = Buffer.alloc(length);
	const fileDescriptor = fs.openSync(filePath, 'r');

	try {
		const bytesRead = fs.readSync(fileDescriptor, buffer, {
			length,
			position: startPosition,
		});

		if (bytesRead < length) {
			buffer = buffer.subarray(0, bytesRead);
		}

        let result = String(buffer);

        if (bytesRead < length) {
            if (!result.endsWith('\n')) {
                result = result + "\n";
            }
        }

        result = result.substring(0, result.lastIndexOf('\n'));

		return result;
	} finally {
		fs.closeSync(fileDescriptor);
	}
}


function writeFile(
    filePath,
    fileData,
) {
    fs.writeFileSync(
        filePath,
        fileData, 
        err => {
            if (err) {
                console.error(err);
            }
        }
    );
}


function stringSplitLines(str) {
    return str.split('\n');
}


function getListFilesDir(path) {
    try {
        return fs.readdirSync(path);
    } catch (err) {
        console.log(err)
    }
}


function main() {
    fs.rmSync(temp_dir, { recursive: true, force: true });

    if (!fs.existsSync(temp_dir)){
        fs.mkdirSync(temp_dir, { recursive: true });
    }

    try {
        fs.unlinkSync(output_file_name);
    } catch (error) { }

    let shift = 0;

    const start_time = Date.time();

    while(true) {
        let rr = readChunkSync(input_file_name, {length: CHUNK_SIZE, startPosition: shift});
        let result = stringSplitLines(rr);

        if (rr && result.length > 0) {
            if (true) {
                result = result.sort().reverse();
            }

            let new_file = generateFileName();

            while (fs.existsSync(temp_dir + new_file)) {
                new_file = generateFileName();
            }

            writeFile(
                temp_dir + new_file,
                result.join('\n'),
            )

            shift = shift + result.join('\n').length + '\n'.length;
            // console.log(result);
        } else {
            break;
        }
    }

    console.log(`sorted for ${(Date.time() - start_time)} seconds.`);

    let minimal_values_file = { };

    const all_files = getListFilesDir(temp_dir);
    let out_data = [];
    let readed_data;
    let result;

    all_files.forEach(file => {
        readed_data = readChunkSync(temp_dir + file, {length: CHUNK_SIZE, startPosition: 0});
        result = stringSplitLines(readed_data);

        minimal_values_file[file] = result.pop();
    });

    while (true) {
        let minimal = {
            "value": undefined,
            "file": undefined,
        };

        for (let file in minimal_values_file) {
            if (minimal['value'] === undefined || minimal_values_file[file] < minimal['value']) {
                minimal = {
                    "value": minimal_values_file[file],
                    "file": file,
                };
            }
        }

        if (Object.entries(minimal_values_file).length == 0) {
            break;
        }

        readed_data = readChunkSync(temp_dir + minimal['file'], {length: CHUNK_SIZE, startPosition: 0});
        result = stringSplitLines(readed_data);

        result.pop();

        if (result.length > 0) {
            fs.truncateSync(
                temp_dir + minimal['file'],
                fs.statSync(temp_dir + minimal['file']).size - minimal['value'].length - '\n'.length,
            )

            minimal_values_file[minimal['file']] = result.pop();
        } else {
            fs.rmSync(temp_dir + minimal['file']);

            delete minimal_values_file[minimal['file']];
        }

        fs.appendFileSync(
            output_file_name,
            minimal['value'] + "\n",
        );
    }

    if (out_data.length > 0) {
        fs.appendFileSync(
            output_file_name,
            out_data.join('\n') + "\n",
        );

        out_data = [];
    }

    console.log(`ended for ${(Date.time() - start_time)} seconds.`);
}

main()