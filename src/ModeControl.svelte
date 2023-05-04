<script>
  export let mode

  const toggleMode = newMode => (mode = newMode)
</script>

<div class="mode-control-group">
  <div class="mode-control mode-control-quadrant" on:click={() => toggleMode('quadrant')} aria-label="Quadrant" tabindex="0" class:active={mode === 'quadrant'}>
    <span class="tooltip">Quadrant</span>
  </div>
  <div class="mode-control mode-control-whole" on:click={() => toggleMode('whole')} aria-label="Whole Image" tabindex="0" class:active={mode === 'whole'}>
    <span class="tooltip">Whole Image</span>
  </div>
</div>

<style>
  .mode-control:hover .tooltip {
    visibility: visible;
    opacity: 1;
  }
  .mode-control-quadrant {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3QgeD0iMzYuNzU0IiB5PSI3Ljk3NiIgd2lkdGg9IjE5LjI3IiBoZWlnaHQ9IjE5LjI3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyOC43NzggNjQpIHJvdGF0ZSgtOTApIiBzdHlsZT0iZmlsbDojZmZmOyIvPjxyZWN0IHg9IjcuOTc2IiB5PSI3Ljk3NiIgd2lkdGg9IjE5LjI3IiBoZWlnaHQ9IjE5LjI3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNS4yMjIgMzUuMjIyKSByb3RhdGUoLTE4MCkiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHJlY3QgeD0iNy45NzYiIHk9IjM2Ljc1NCIgd2lkdGg9IjE5LjI3IiBoZWlnaHQ9IjE5LjI3IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg2NCAyOC43NzgpIHJvdGF0ZSg5MCkiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PHJlY3QgeD0iMzYuNzU0IiB5PSIzNi43NTQiIHdpZHRoPSIxOS4yNyIgaGVpZ2h0PSIxOS4yNyIgc3R5bGU9ImZpbGw6I2ZmZjsiLz48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHN0eWxlPSJmaWxsOm5vbmU7Ii8+PC9zdmc+');
  }
  .mode-control-whole {
    background: url('data:image/svg+xml;base64,PHN2ZyBpZD0iYSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBzdHlsZT0iZmlsbDpub25lOyIvPjxyZWN0IHg9IjExLjczIiB5PSIxMS43MyIgd2lkdGg9IjQwLjU0MSIgaGVpZ2h0PSI0MC41NDEiIHN0eWxlPSJmaWxsOiNmZmY7Ii8+PC9zdmc+');
  }
  .mode-control-group {
    display: flex;
    position: relative;
  }
  .mode-control-quadrant,
  .mode-control-whole {
    width: 40px;
    height: 40px;
    background-size: 100%;
    background-repeat: no-repeat;
    background-position: center;
    cursor: pointer;
    position: relative;
    margin: 0 5px;
    transition: all 0.3s;
    opacity: 0.4;
    display: block;
  }
  .mode-control-quadrant:hover,
  .mode-control-whole:hover {
    opacity: 1;
  }
  .active {
    opacity: 1;
    border: 1px;
    background-color: (255, 255, 255, 0.4);
  }
</style>
