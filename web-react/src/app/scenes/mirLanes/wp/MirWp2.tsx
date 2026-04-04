import Drag from '@components/primitives/drag/Drag';

export default function MirWp2() {

    return (
        <div className="scene-root non-interactive">
            <Drag
                id='wp2-drag'
                className='button-base move-col'
            // locked={true}

            >
                <p>futurebtn</p>
            </Drag>
        </div>
    )
}