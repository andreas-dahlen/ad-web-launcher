import Drag from '@components/primitives/drag/Drag';

export default function MirMid1() {

    return (
        <div className="scene-root non-interactive">
            <Drag
                id='mid1-drag'
                className='button-base move-col'
            // locked={true}

            >
                <p>futurebtn</p>
            </Drag>
        </div >
    )
}