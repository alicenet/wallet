import { Button, Header, Segment } from 'semantic-ui-react';
import { toast } from 'react-toastify';
import { SyncToastMessageSuccess } from "components/customToasts/CustomToasts";
import { SyncToastMessageWarning } from "components/customToasts/CustomToasts";
import utils from "util/_util";

export default function ToastPanel() {

    const dummyHash = "fbccac783ae7a818cca2ea4483518f65c0d139d7f5c8c3a4ebfe284653af1769"

    const txHashPendingToast = () => {
        toast.success(<SyncToastMessageWarning basic title="TX Pending" message={utils.string.splitStringWithEllipsis(dummyHash, 8)} hideIcon />)
    }

    const txMinedToast = () => {
        toast.success(<SyncToastMessageSuccess basic title="TX Mined" message={dummyHash} hideIcon />)
    }

    return (

        <Segment>
            
            <Header content="Toast Tester" />

            <Button content="Tx Pending" onClick={txHashPendingToast} />
            <Button content="Tx Mined" onClick={txMinedToast} />

        </Segment>

    )

}