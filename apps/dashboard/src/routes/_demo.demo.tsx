import { createFileRoute } from '@tanstack/react-router'
import { DemoPage } from '../pages/demo/index'

export const Route = createFileRoute('/_demo/demo')({
  component: DemoPage,
})
