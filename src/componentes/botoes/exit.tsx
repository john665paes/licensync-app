import { router } from "expo-router";
import React from "react";
import { Touchable, TouchableOpacity } from "react-native"
import Svg, { Path, G} from 'react-native-svg';

export function BotaoSair() {

   return (
    <TouchableOpacity onPress={() => {
        router.replace('/')
    }}>
        <Svg height="32" id="svg8" viewBox="0 0 12.7 12.7" width="48" color={"white"}>
            <G id="layer1" transform="translate(0,-284.3)" >
                <Path d="M 7.0555553,285.71111 H 2.1166666 v 9.87779 h 4.938889 v -0.70557 H 2.8222222 v -8.46667 h 4.2333334 z" id="path12" fill={"white"} />
                <Path d="M 4.2333334,289.94445 H 9.172222 l -2.1166667,-2.11667 0.7055557,-0.70555 3.527778,3.52776 -3.527778,3.52779 -0.7055554,-0.70555 2.1166666,-2.11666 H 4.2333334 Z" id="path822" fill="white" />
            </G>
        </Svg>
    </TouchableOpacity>
   ) 
}