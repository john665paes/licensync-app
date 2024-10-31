import { router } from 'expo-router'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import Svg, { Path } from 'react-native-svg'

export function BotaoVoltar() {
    
    return (
        <TouchableOpacity onPress={() => router.back()}>
            <Svg style={{marginLeft: 10}} width="28" height="28" viewBox="0 0 28 28" fill="none">
                <Path d="M27.125 15.75C26.8386 13.2191 25.6214 10.885 23.7099 9.20157C21.7985 7.51813 19.3293 6.60556 16.7825 6.64125H3.50001L6.34376 2.625C6.41185 2.53014 6.46026 2.42261 6.48615 2.30874C6.51204 2.19488 6.51487 2.07699 6.49449 1.96201C6.4741 1.84703 6.43091 1.7373 6.36745 1.63928C6.304 1.54125 6.22156 1.45692 6.12501 1.39125C5.93568 1.25841 5.70146 1.20592 5.47355 1.24528C5.24564 1.28463 5.04258 1.41261 4.90876 1.60125L1.00626 7.07C0.916267 7.19814 0.867981 7.35092 0.867981 7.5075C0.867981 7.66409 0.916267 7.81686 1.00626 7.945L4.91751 13.4225C5.05926 13.5858 5.25648 13.6909 5.47112 13.7174C5.68575 13.7439 5.9026 13.69 6.07982 13.566C6.25704 13.4421 6.38209 13.2569 6.43083 13.0462C6.47957 12.8355 6.44855 12.6142 6.34376 12.425L3.50001 8.39125H16.7825C18.9267 8.36265 21.0028 9.14425 22.5957 10.5799C24.1887 12.0155 25.1813 13.9994 25.375 16.135C25.4517 17.2717 25.2941 18.4121 24.9121 19.4854C24.53 20.5588 23.9316 21.5422 23.1539 22.3749C22.3763 23.2075 21.4359 23.8716 20.3911 24.3259C19.3463 24.7803 18.2193 25.0152 17.08 25.0163H1.75001C1.51794 25.0163 1.29538 25.1084 1.13129 25.2725C0.967195 25.4366 0.875008 25.6592 0.875008 25.8913C0.875008 26.1233 0.967195 26.3459 1.13129 26.51C1.29538 26.6741 1.51794 26.7663 1.75001 26.7663H17.0625C18.4678 26.7712 19.8585 26.4821 21.1453 25.9174C22.4321 25.3527 23.5865 24.5249 24.5343 23.4873C25.482 22.4498 26.2021 21.2253 26.6483 19.8928C27.0945 18.5602 27.2569 17.1491 27.125 15.75Z" fill="white"/>
                <Path d="M4.90001 13.7988L0.988759 8.32126C0.902232 8.19176 0.856049 8.03951 0.856049 7.88376C0.856049 7.72801 0.902232 7.57576 0.988759 7.44626L4.90001 1.95126C4.96699 1.85731 5.05189 1.77753 5.14982 1.71652C5.24775 1.65552 5.35678 1.61448 5.47064 1.59577C5.58449 1.57707 5.70092 1.58107 5.81323 1.60754C5.92553 1.63401 6.03149 1.68243 6.12501 1.75001C6.21896 1.81699 6.29874 1.90189 6.35974 1.99982C6.42075 2.09775 6.46179 2.20679 6.4805 2.32064C6.4992 2.4345 6.4952 2.55093 6.46873 2.66323C6.44226 2.77553 6.39384 2.88149 6.32626 2.97501L2.82626 7.87501L6.32626 12.775C6.39384 12.8685 6.44226 12.9745 6.46873 13.0868C6.4952 13.1991 6.4992 13.3155 6.4805 13.4294C6.46179 13.5432 6.42075 13.6523 6.35974 13.7502C6.29874 13.8481 6.21896 13.933 6.12501 14C6.03149 14.0676 5.92553 14.116 5.81323 14.1425C5.70092 14.169 5.58449 14.173 5.47064 14.1543C5.35678 14.1355 5.24775 14.0945 5.14982 14.0335C5.05189 13.9725 4.96699 13.8927 4.90001 13.7988Z" fill="white"/>
                <Path d="M16.765 6.99999H1.75C1.51794 6.99999 1.29538 7.09218 1.13128 7.25628C0.967187 7.42037 0.875 7.64293 0.875 7.87499C0.875 8.10706 0.967187 8.32962 1.13128 8.49371C1.29538 8.65781 1.51794 8.74999 1.75 8.74999H16.765C18.9122 8.71694 20.9926 9.49655 22.5893 10.9326C24.186 12.3686 25.181 14.355 25.375 16.4937C25.4518 17.6319 25.2937 18.7738 24.9106 19.8483C24.5275 20.9228 23.9275 21.9071 23.1479 22.74C22.3684 23.5729 21.4259 24.2366 20.379 24.6899C19.3322 25.1432 18.2033 25.3764 17.0625 25.375H1.75C1.51794 25.375 1.29538 25.4672 1.13128 25.6313C0.967187 25.7954 0.875 26.0179 0.875 26.25C0.875 26.4821 0.967187 26.7046 1.13128 26.8687C1.29538 27.0328 1.51794 27.125 1.75 27.125H17.0625C18.4694 27.1302 19.8617 26.8406 21.1499 26.2749C22.438 25.7091 23.5933 24.8797 24.5413 23.8402C25.4893 22.8007 26.209 21.5741 26.654 20.2394C27.099 18.9048 27.2595 17.4917 27.125 16.0912C26.8362 13.5596 25.6153 11.2262 23.7001 9.54558C21.7849 7.86495 19.3127 6.95749 16.765 6.99999Z" fill="white"/>
            </Svg>
        </TouchableOpacity> 
    
)
}

