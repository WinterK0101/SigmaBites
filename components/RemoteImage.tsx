import React, { useEffect, useState } from 'react';
import { Image, ActivityIndicator, View } from 'react-native';
import { getSignedImageUrl } from '@/utils/getImageUrl';
import { StyleProp, ImageStyle } from 'react-native';

type Props = {
    filePath?: string;
    bucket?: string;
    expiresIn?: number;
    style?: StyleProp<ImageStyle>;
};

export default function RemoteImage({
                                        filePath,
                                        bucket = 'avatars',
                                        expiresIn = 60,
                                        style = { width: 200, height: 200 },
                                    }: Props) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const pathToUse = filePath || 'default-profile.png';
        getSignedImageUrl(bucket, pathToUse, expiresIn).then(setUrl);
    }, [filePath]);

    if (!url) return <ActivityIndicator />;

    return <Image source={{ uri: url }} style={style} />;
}
