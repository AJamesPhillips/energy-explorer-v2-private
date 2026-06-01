import { CarbonFuelsOptions } from "./CarbonFuelsOptions"
import { ElectricityGenerationOptions } from "./ElectricityGenerationOptions"


export function ActionOptions()
{
    return <>
        {/* <GovernmentPolicyOptions /> */}
        <CarbonFuelsOptions />
        <ElectricityGenerationOptions />
    </>
}
