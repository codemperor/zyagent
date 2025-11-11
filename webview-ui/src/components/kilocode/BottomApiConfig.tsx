// import { ModelSelector } from "./chat/ModelSelector"
// import { useExtensionState } from "@/context/ExtensionStateContext"
// import { useSelectedModel } from "../ui/hooks/useSelectedModel"

export const BottomApiConfig = () => {
	// kilocode_change: Hidden but not deleted
	return null

	// const { currentApiConfigName, apiConfiguration, virtualQuotaActiveModel } = useExtensionState() // kilocode_change: Get virtual quota active model for UI display
	// const { id: selectedModelId, provider: selectedProvider } = useSelectedModel(apiConfiguration)

	// if (!apiConfiguration) {
	// 	return null
	// }

	// return (
	// 	<>
	// 		{/* kilocode_change - add data-testid="model-selector" below */}
	// 		<div className="w-auto overflow-hidden" data-testid="model-selector">
	// 			<ModelSelector
	// 				currentApiConfigName={currentApiConfigName}
	// 				apiConfiguration={apiConfiguration}
	// 				fallbackText={`${selectedProvider}:${selectedModelId}`}
	// 				//kilocode_change: Pass virtual quota active model to ModelSelector
	// 				virtualQuotaActiveModel={
	// 					virtualQuotaActiveModel
	// 						? { id: virtualQuotaActiveModel.id, name: virtualQuotaActiveModel.id }
	// 						: undefined
	// 				}
	// 			/>
	// 		</div>
	// 	</>
	// )
}
