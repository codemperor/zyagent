import { Button } from "@/components/ui"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { cn } from "@/lib/utils"

type MedicalKnowledgeToggleProps = {
	selected: boolean
	onSelect: () => void
	onDeselect: () => void
	className?: string
}

export const MedicalKnowledgeToggle = ({ selected, onSelect, onDeselect, className }: MedicalKnowledgeToggleProps) => {
	const { t } = useAppTranslation()
	const label = t("chat:medicalKnowledgeBaseLabel")
	const forceTag = t("chat:medicalKnowledgeBaseForceTag")

	const handleClick = () => {
		if (selected) {
			onDeselect()
		} else {
			onSelect()
		}
	}

	return (
		<div className={cn("flex flex-col items-start gap-1", className)}>
			<Button
				type="button"
				variant="outline"
				size="sm"
				aria-pressed={selected}
				onClick={handleClick}
				className={cn(
					"px-3 py-1.5 text-xs font-medium transition-all duration-150",
					selected
						? "border-vscode-focusBorder bg-[rgba(88,129,255,0.18)] text-vscode-foreground shadow-[0_0_0_1px_var(--vscode-focusBorder)]"
						: "text-vscode-foreground/90 hover:text-vscode-foreground",
				)}>
				<span>{label}</span>
				{selected && (
					<span className="ml-2 rounded-full bg-[rgba(255,255,255,0.16)] px-2 py-0.5 text-[11px] font-semibold leading-none text-vscode-foreground">
						{forceTag}
					</span>
				)}
			</Button>
		</div>
	)
}
