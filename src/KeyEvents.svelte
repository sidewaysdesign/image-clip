<script>
  import { onMount, onDestroy } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  const handleKeydown = event => {
    dispatch('keyevent', event)
  }

  onMount(() => document.addEventListener('keydown', handleKeydown))
  onDestroy(() => document.removeEventListener('keydown', handleKeydown))
</script>
