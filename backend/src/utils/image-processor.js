import PixelBinPkg from "@pixelbin/admin";
const { PixelbinConfig, PixelbinClient } = PixelBinPkg;
import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * Removes watermark from an image using Pixelbin AI.
 */
export async function removeWatermark(inputBuffer) {
    const cloudName = process.env.PIXELBIN_CLOUD_NAME;
    const apiToken = process.env.PIXELBIN_API_TOKEN;

    if (!cloudName || !apiToken) {
        throw new Error('Pixelbin credentials (PIXELBIN_CLOUD_NAME, PIXELBIN_API_TOKEN) are missing in .env');
    }

    try {
        // Initialize Pixelbin SDK
        console.log(`Starting Pixelbin removal for cloud: ${cloudName}`);
        const config = new PixelbinConfig({
            domain: "https://api.pixelbin.io",
            apiSecret: apiToken,
        });
        const pixelbin = new PixelbinClient(config);

        // 1. Upload image to Pixelbin
        console.log('Uploading image to Pixelbin...');
        const uploadResponse = await pixelbin.uploader.upload({
            file: inputBuffer,
            name: "removal-" + Date.now() + ".png",
            overwrite: true
        });

        // Use fileId as the path
        const fileId = uploadResponse.fileId;
        console.log(`Upload successful. File ID: ${fileId}`);

        if (!fileId) {
            throw new Error('Could not determine file ID from upload response');
        }

        // 2. Construct the transformed URL
        const transformation = "wm.remove(rem_text:true,rem_logo:true)";
        const transformedUrl = `https://cdn.pixelbin.io/v2/${cloudName}/${transformation}/${fileId}`;
        console.log(`Fetching transformed image: ${transformedUrl}`);

        // 3. Fetch the processed image
        const imageResponse = await axios.get(transformedUrl, {
            responseType: 'arraybuffer'
        });

        console.log('Successfully fetched processed image from Pixelbin');
        return {
            buffer: Buffer.from(imageResponse.data),
            originalUrl: `https://cdn.pixelbin.io/v2/${cloudName}/original/${fileId}`,
            processedUrl: transformedUrl
        };
    } catch (error) {
        const errorMsg = error.response?.data
            ? (Buffer.isBuffer(error.response.data) ? error.response.data.toString() : JSON.stringify(error.response.data))
            : error.message;

        console.error('Error in Pixelbin watermark removal:', errorMsg);
        throw new Error('AI Watermark removal failed: ' + errorMsg);
    }
}
